import "./style/Home.css";
import React from 'react';
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider, createHashRouter } from 'react-router-dom';
import AboutUsComponent from './component/AboutUsComponent';
import InvestComponent from './component/InvestComponent';
import HeaderComponent from './component/HeaderComponent';
import PuddleComponent from './component/PuddleComponent';
import MarketComponent from './component/MarketComponent';
import TraderComponent from './component/TraderComponent';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<HeaderComponent />}>
      <Route index element={<AboutUsComponent />} />
      <Route path="invest" element={<InvestComponent />} />
      <Route path="puddle" element={<PuddleComponent />} />
      <Route path="market" element={<MarketComponent />} />
      <Route path="trader" element={<TraderComponent />} />
    </Route>
  )
)

export default function App() {

  return (
    <>
      <RouterProvider router={router}/>
    </>
  );
}