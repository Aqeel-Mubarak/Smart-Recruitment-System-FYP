import React, { createContext, useContext, useState } from "react";

// Create the context
const AppContext = createContext();

// Provide the context
export const AppProvider = ({ children }) => {
  const [popUp, setPopUp] = useState(false); // For managing the popup state
  const [events, setEvents] = useState([])
  const [user, setUser] = useState('HR'); // For managing the popup state
  const [candidateid,setCandidateid]=useState()
  const [booked,setBooked]=useState(false)

  
  return (
    <AppContext.Provider value={{ popUp, setPopUp,events,setEvents,user, setUser,candidateid,setCandidateid,booked,setBooked}}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  return useContext(AppContext);
};
