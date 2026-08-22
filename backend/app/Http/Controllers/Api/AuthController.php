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
        $request->validate([
            'email' => 'required',
            'password' => 'required',
        ]);

        $identifier = trim($request->email);
        $user = User::where('email', 'ILIKE', $identifier)
            ->orWhere('name', 'ILIKE', $identifier)
            ->orWhere('national_id', $identifier)
            ->orWhere('phone', $identifier)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials provided.',
            ], 401);
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
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'national_id' => 'required|string|unique:users',
            'phone' => 'required|string',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'national_id' => $request->national_id,
            'phone' => $request->phone,
            'ward_id' => $request->input('ward_id', 1),
            'password' => Hash::make($request->password),
            'role' => 'applicant',
            'designation' => 'Student / Bursary Applicant',
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
            'token' => $token,
            'user' => $user,
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
