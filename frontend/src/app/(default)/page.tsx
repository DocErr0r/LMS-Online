'use client';
import { FC } from 'react';
import HeadingHtml from '@/utils/HeadingHtml';

const title: string = 'LMS ELearning';
const description: string = 'Elearning is a platform there student can learn and get help from teachers';
const keywords: string = 'Programming, MERN, React, machine learning';

const Page: FC = () => {
  return (
    <>
      <HeadingHtml title={title} description={description} keywords={keywords} />
      {/* <div>page</div> */}
      <div className="h-[70vh] ">page</div>
      <div className="min-h-screen">
        <div className="container mx-auto p-8">
          {/* Using custom fonts */}
          {/* <h1 className="font-poppins text-4xl font-bold text-purple-primary mb-4">Welcome to My App</h1> */}

          <p className="font-josefin text-lg text-text dark:text-purple-text mb-8">This text automatically switches color in dark mode</p>

          {/* Custom purple elements */}
          <div className="grid gap-6">
            <div className="p-6 bg-purple-primary text-white rounded-lg">Primary Purple Background</div>

            <div className="p-6 bg-purple-secondary text-white rounded-lg">Secondary Purple Background</div>

            <div className="p-6 bg-purple-dark text-white rounded-lg">Dark Purple Background</div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Page;
