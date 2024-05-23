import React from "react";
import Button from "react-bootstrap/Button";
import { useState, useEffect } from "react";
import ReactLoading from "react-loading";
const App = () => {
  const [input, setInput] = useState("");
  const [zillowEstimate, setZillowEstimate] = useState("");
  const [realtorEstimate, setRealtorEstimate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setInput(e.target.value);
  };
  const handleSubmit = async (e) => {
    setIsLoading(true);
    console.log("input:", input);
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      });
      const rentalEstimates = await response.json();
      console.log("Rental Estimates:", rentalEstimates);
      // const data = await response.json();
      setZillowEstimate(rentalEstimates.rentEstimate.zillowEstimate);
      
      setRealtorEstimate(rentalEstimates.rentEstimate.realtorEstimate);
      setIsLoading(false);  
      console.log("Rent estimate:", rentalEstimates.zillowEstimate);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <main className="h-dvh">
      <div className="justify-items-center h-full bg-slate-400 ">
        <h1 className="text-red-500 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.3)] font-bold text-center text-xl ">
          Zenn Estimator
        </h1>
        <div className="">
          <form className="text-center m-6" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              className="border-red-500 border-4 rounded-2xl p-1 placeholder:text-black w-2/3"
              onChange={handleChange}
              placeholder="  Search for an address..."
            />
            <button
              type="submit"
              className="bg-white text-red-500 ml-1 rounded-2xl p-1 hover:bg-red-500 hover:text-white"
            >
              Search
            </button>
          </form>
          
          
        </div>
        <section className="p-4 bg-slate-50 h-5/6 ml-8 mr-8 border-red-500 border-4 rounded-2xl ">
        {isLoading ? <ReactLoading type="spin" color="#f00"  height={30} width={30} />: null}
          <div className="bg-red-300 mb-8 mt-12 rounded-lg h-1/4 p-2    ">
            <h2 className="text-xl text-left  ">Zillow's Rent Estimate: </h2>
            <div className="text-3xl w-1/2 h-1/2 m-auto mt-6  text-center">
              {zillowEstimate}
            </div>
          </div>
          <div className="bg-red-300 mb-8 rounded-lg h-1/4 p-2   ">
            <h2 className="text-xl">Redfin's Rent Estimate: </h2>
            <div className="text-3xl w-1/2 h-1/2 m-auto mt-6  text-center">
              
            </div>
          </div>
          <div className="bg-red-300 mb-8 rounded-lg h-1/4 p-2   ">
            <h2 className="text-xl">Realtor's Rent Estimate: </h2>
            <div className="text-3xl w-1/2 h-1/2 m-auto mt-6  text-center">
              {realtorEstimate}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default App;
