'use client';
import Header from './components/header/Header';
import { FC, useState } from 'react';
import HeadingHtml from '@/utils/HeadingHtml';

// import type { Metadata } from 'next';
// export const metadata: Metadata = {
// title: 'LMS ELearning',
// description: 'Elearning is a platform there student can learn and get help from teachers',
// keywords: 'Programming, MERN, React, machine learning',
// };
const Page: FC = () => {
    const [open, setOepn] = useState(false);
    const [avtiveItem, setAvtiveItem] = useState(0);
    return (
        <>
            <HeadingHtml title="LMS ELearning" description="Elearning is a platform there student can learn and get help from teachers" keywords="Programming, MERN, React, machine learning" />
            <Header open={open} setOpen={setOepn} activeItem={avtiveItem} />
            {/* <div>page</div> */}
            <div className="h-[100vh] ">page</div>
            <main className="min-h-screen bg-theme-gradient">
                <div className="container mx-auto p-8">
                    {/* Using custom fonts */}
                    <h1 className="font-poppins text-4xl font-bold text-purple-primary mb-4">Welcome to My App</h1>

                    <p className="font-josefin text-lg text-purpleLight-text dark:text-purple-text mb-8">This text automatically switches color in dark mode</p>

                    {/* Custom purple elements */}
                    <div className="grid gap-6">
                        <div className="p-6 bg-purple-primary text-white rounded-lg">Primary Purple Background</div>

                        <div className="p-6 bg-purple-secondary text-white rounded-lg">Secondary Purple Background</div>

                        <div className="p-6 bg-purple-dark text-white rounded-lg">Dark Purple Background</div>
                    </div>
                </div>
            </main>
        </>
    );
};
export default Page;
