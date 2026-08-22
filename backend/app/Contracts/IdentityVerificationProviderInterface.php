<?php

namespace App\Contracts;

interface IdentityVerificationProviderInterface
{
    /**
     * Verify citizen identity against authorized identity registry
     * 
     * @param string $nationalId
     * @param string $fullName
     * @return array
     */
    public function verify(string $nationalId, string $fullName): array;
}
