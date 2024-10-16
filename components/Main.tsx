"use client";
import Image from "next/image";
import CalendarContainer from "./Tabels/CalendarContainer";



function Main() {
 
  return (
    <section className="bg-[url('/desert2.jpg')] bg-no-repeat bg-center bg-cover h-full w-full  p-0 sm:p-10 max-sm:py-10 my-0">
      <div className="container max-sm:px-0 bg-white/70 mt-20 rounded-xl py-5">
        <div className="flex max-lg:flex-col items-center justify-between max-lg:mb-10 mt-20 ">
          <div>
            <Image src="/Camel.png" width={512} height={512} alt="Camel" />
          </div>
          <div className="flex flex-col items-end justify-center gap-5 max-lg:items-center">
            <h1 className=" text-6xl text-right max-lg:text-center max-lg:text-5xl max-md:text-4xl max-sm:text-3xl">
              انضم إلى مجتمع سباقات الهجن <br /> ! وتواصل من أي مكان
            </h1>
            <p className="text-2xl max-lg:text-xl max-md:text-lg max-sm:text-base">
              ! ابدا رحلتك الآن
            </p>
          </div>
        </div>
       <CalendarContainer />
      </div>
    </section>
  );
}

export default Main;
