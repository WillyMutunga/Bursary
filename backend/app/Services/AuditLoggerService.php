<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Request;

class AuditLoggerService
{
    public static function log(
        string $action,
        string $module,
        ?string $recordId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?int $userId = null,
        ?string $userName = null,
        ?string $userRole = null
    ): AuditLog {
        $user = auth()->user();

        return AuditLog::create([
            'user_id' => $userId ?? ($user ? $user->id : null),
            'user_name' => $userName ?? ($user ? $user->name : 'System Automated Service'),
            'user_role' => $userRole ?? ($user ? $user->role : 'system'),
            'action' => $action,
            'module' => $module,
            'record_id' => $recordId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip() ?? '127.0.0.1',
        ]);
    }
}
