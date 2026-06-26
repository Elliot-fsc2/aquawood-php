<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request): RedirectResponse|JsonResponse
    {
        $redirectTo = $request->input('redirectTo') ?? $request->query('redirectTo');

        $home = $redirectTo && $this->isValidLocalUrl($redirectTo)
            ? $redirectTo
            : config('fortify.home');

        return $request->wantsJson()
            ? new JsonResponse(['two_factor' => false], 200)
            : redirect()->intended($home);
    }

    private function isValidLocalUrl(string $url): bool
    {
        $parsed = parse_url($url);

        if (! isset($parsed['host'])) {
            return true;
        }

        return $parsed['host'] === parse_url(config('app.url'), PHP_URL_HOST);
    }
}
