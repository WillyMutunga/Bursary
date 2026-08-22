<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Institution;
use App\Models\SchoolConfirmation;
use App\Services\AuditLoggerService;
use Illuminate\Http\Request;

class SchoolPortalController extends Controller
{
    public function index(Request $request)
    {
        $schoolId = $request->query('school_id');
        $user = $request->user();
        if (!$schoolId && $user && $user->school_id) {
            $schoolId = $user->school_id;
        }
        if (!$schoolId) $schoolId = 1;

        $institution = Institution::find($schoolId);

        $students = Application::with('schoolConfirmations')
            ->where('institution_id', $schoolId)
            ->select('id', 'application_no', 'full_name', 'admission_no', 'course_name', 'year_of_study', 'fee_balance', 'stage', 'approved_amount')
            ->get();

        return response()->json([
            'success' => true,
            'institution' => $institution,
            'students' => $students,
        ]);
    }

    public function confirmStudent(Request $request, $applicationId)
    {
        $request->validate([
            'is_enrolled' => 'required|boolean',
            'confirmed_admission_no' => 'required|string',
            'confirmed_fee_balance' => 'required|numeric',
            'comments' => 'nullable|string',
        ]);

        $app = Application::findOrFail($applicationId);
        $user = $request->user();
        $verifierId = $user ? $user->id : 5;

        $conf = SchoolConfirmation::updateOrCreate(
            ['application_id' => $app->id, 'institution_id' => $app->institution_id],
            [
                'verified_by_user_id' => $verifierId,
                'is_enrolled' => $request->is_enrolled,
                'confirmed_admission_no' => $request->confirmed_admission_no,
                'confirmed_fee_balance' => $request->confirmed_fee_balance,
                'comments' => $request->comments,
                'confirmed_at' => now(),
            ]
        );

        AuditLoggerService::log(
            action: 'SCHOOL_ENROLLMENT_CONFIRMED',
            module: 'School Portal',
            recordId: (string)$conf->id,
            newValues: ['enrolled' => $request->is_enrolled, 'fee_balance' => $request->confirmed_fee_balance]
        );

        return response()->json([
            'success' => true,
            'message' => "Student record verified by school administration.",
            'data' => $conf,
        ]);
    }
}
