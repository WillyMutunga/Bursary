<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditLoggerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'email' => 'required',
            'password' => 'required',
        ], [
            'email.required' => 'Please enter your username, National ID, or email.',
            'password.required' => 'Please enter your password.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $identifier = trim($request->email);
        $cleanPhone = preg_replace('/[^0-9]/', '', $identifier);

        $user = User::where(function ($query) use ($identifier, $cleanPhone) {
            $query->where('national_id', 'ILIKE', $identifier)
                ->orWhere('email', 'ILIKE', $identifier)
                ->orWhere('name', 'ILIKE', $identifier);

            if (!empty($cleanPhone) && strlen($cleanPhone) >= 6) {
                $query->orWhere('national_id', $cleanPhone);
            }
        })->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials provided. Please verify your National ID / Birth Certificate Number and Password.',
            ], 401);
        }

        // Strict Applicant Enforcement: Applicants must log in ONLY with their ID / Birth Cert No, not name or email
        if ($user->role === 'applicant') {
            $matchedById = (strcasecmp(trim($user->national_id), $identifier) === 0)
                || (!empty($cleanPhone) && strcasecmp(trim($user->national_id), $cleanPhone) === 0);

            if (!$matchedById) {
                return response()->json([
                    'success' => false,
                    'message' => 'Applicants must log in using their National ID or Birth Certificate Number only (not name or email).',
                ], 403);
            }
        }

        $token = $user->createToken('bursary_auth_token')->plainTextToken;

        AuditLoggerService::log(
            action: 'USER_LOGIN',
            module: 'Authentication',
            recordId: (string)$user->id,
            userId: $user->id,
            userName: $user->name,
            userRole: $user->role
        );

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'national_id' => $user->national_id,
                'ward_id' => $user->ward_id,
                'school_id' => $user->school_id,
                'designation' => $user->designation,
            ],
        ]);
    }

    public function register(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'national_id' => 'required|string|max:50|unique:users,national_id',
            'phone' => 'required|string|max:30',
            'password' => 'required|string|min:6',
            'ward_id' => 'nullable|integer',
        ], [
            'email.unique' => 'An account with this email address already exists. Please log in with your email or ID.',
            'national_id.unique' => 'An account with this National ID number already exists. Please log in with your ID number.',
            'password.min' => 'Password must be at least 6 characters long.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name' => trim($request->name),
            'email' => strtolower(trim($request->email)),
            'national_id' => trim($request->national_id),
            'phone' => trim($request->phone),
            'ward_id' => $request->input('ward_id', 1),
            'password' => Hash::make($request->password),
            'role' => 'applicant',
            'designation' => 'Student / Bursary Applicant',
            'is_active' => true,
        ]);

        $token = $user->createToken('bursary_auth_token')->plainTextToken;

        AuditLoggerService::log(
            action: 'APPLICANT_REGISTERED',
            module: 'Authentication',
            recordId: (string)$user->id,
            userId: $user->id,
            userName: $user->name,
            userRole: $user->role
        );

        return response()->json([
            'success' => true,
            'message' => 'Account registered successfully!',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'national_id' => $user->national_id,
                'ward_id' => $user->ward_id,
                'designation' => $user->designation,
            ],
        ], 201);
    }

    public function demoUsers()
    {
        $users = User::select('id', 'name', 'email', 'role', 'designation', 'national_id')->get();
        return response()->json(['success' => true, 'data' => $users]);
    }

    public function user(Request $request)
    {
        return response()->json(['success' => true, 'user' => $request->user()]);
    }
}
