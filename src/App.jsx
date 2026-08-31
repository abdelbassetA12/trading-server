import { BrowserRouter, Routes, Route  } from "react-router-dom";
 import "./app.css";
 
 
import MainNavbar from "./components/landing/components/MainNavbar";
 
 
 
 

import Backtest from "./pages/testnet/Backtest";
import TestnetShart from "./pages/testnet/TestnetShart";
import SignalsPage from "./pages/testnet/SignalsPage";

import NewBacktest from "./pages/newtestnet/Backtest";

import NewTestnetShart from "./pages/newtestnet/TestnetShart";
import NewSignals from "./pages/newtestnet/SignalsPage";





 
import NotFound from "./pages/NotFound";

import { Toaster } from "react-hot-toast";

 
 


 

 






export default function App() {
 
  return (
    <BrowserRouter>
    
<MainNavbar />
            {/* */}
 
         
    
        <Routes>
        
 

      
          <Route path="/" element={ <SignalsPage   />} />
         

           <Route path="/backtest" element={<Backtest />} />
          <Route path="/signals" element={<SignalsPage />} />
         <Route path="/testnetShart" element={<TestnetShart />} />


         <Route path="/NewBacktest" element={<NewBacktest />} />
         <Route path="/NewTestnetShart" element={<NewTestnetShart />} />
         <Route path="/NewSignals" element={<NewSignals />} />
        
         
    
        
      
        

 

         
        
       
       
        



          
         
<Route path="*" element={<NotFound />} />
        
         
         
         
          


        </Routes>
      
        <Toaster position="top-right" reverseOrder={false} />
    
    </BrowserRouter>
  );
}
 