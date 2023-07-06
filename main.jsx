import React, {useState} from "react"
import ReactDOM from "react-dom/client"
import {
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
    Route
} from "react-router-dom";

import Home from "./app/screens/Home.jsx"
import Search from "./app/screens/Search.jsx"
import {fetchDomains} from "./app/rest.js";
import ProteinSummary from "./app/screens/ProteinSummary.jsx";
import Downloads from "./app/screens/Downloads.jsx";


export const OpenProtGlobalContext = React.createContext(null)

const Root = () => {

    const [globalState, setGlobalState] = useState({})

    return <OpenProtGlobalContext.Provider value={{globalState, setGlobalState}}>
        <RouterProvider router={createBrowserRouter(createRoutesFromElements(routes()))} />
    </OpenProtGlobalContext.Provider>
}


const routes = ()=> <>
    <Route
        path="/"
        element={<Home/>}
    />
    <Route
        path="/proteins"
        loader={async ({params}) => new Response("", {
          status: 302,
          headers: {
            Location: '/proteins/HS',
          },
        })}
    />
    <Route
        path="/proteins/:species_sn"
        loader={
            async ({params}) => {
                return params.species_sn
            }
        }
        element={<Search />}
    />
    <Route
        path="/downloads"
        element={<Downloads species_sn={"HS"}/>}
    />
    <Route
        path="/proteins/:species_sn/:protein_seq_id"
        loader={({params}) => {
            return fetchDomains(params.protein_seq_id).then(d => {
                if(d) {
                    d.protein_seq_id = params.protein_seq_id
                    return [params.species_sn, d]
                }
                return [params.species_sn, {protein_seq_id: params.protein_seq_id}]
            })
        }}
        element={<ProteinSummary />}
    />
</>



ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
      <Root/>
  </React.StrictMode>
);