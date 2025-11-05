
import React from 'react';
import { LogoIcon } from './icons';
import { HeroIllustration } from './HeroIllustration';

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex">
            {/* Left side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>

            {/* Right side: Branding/Illustration */}
            <div className="hidden lg:flex w-1/2 bg-sky-100 flex-col items-center justify-center p-12 text-center text-sky-900 relative overflow-hidden">
                <div className="z-10">
                    <div className="flex justify-center mb-6">
                        <LogoIcon className="h-16 w-16" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Welcome to Gluceel</h1>
                    <div className="space-y-3 text-lg text-sky-800">
                       <p>تابع سكر طفلك بكل سهولة وثقة.</p>
                       <p>احصل على رؤى ذكية من Gemini لتحليل الأنماط.</p>
                       <p>تواصل بفعالية مع طبيبك وفريق الرعاية.</p>
                    </div>
                    <HeroIllustration className="w-full max-w-md mx-auto mt-8" />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
