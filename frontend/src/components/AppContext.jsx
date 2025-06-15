import React, { createContext, useContext, useState } from "react";

// Create a new context that will be used throughout the application
// This context will hold global state and functions that can be accessed by any component
const AppContext = createContext();

// AppProvider component that wraps the application and provides context values
// This component manages all the global state and makes it available to child components
export const AppProvider = ({ children }) => {
  // State for controlling popup visibility across the application
  const [popUp, setPopUp] = useState(false);
  
  // State for managing events data
  const [events, setEvents] = useState([])
  
  // State for tracking the current user role (defaults to 'HR')
  const [user, setUser] = useState('HR');
  
  // State for storing the currently selected candidate's ID
  const [candidateid,setCandidateid]=useState()
  
  // State for tracking booking status
  const [booked,setBooked]=useState(false)

  // Provide all state values and their setters to child components
  return (
    <AppContext.Provider value={{ popUp, setPopUp,events,setEvents,user, setUser,candidateid,setCandidateid,booked,setBooked}}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook that provides easy access to the context
// Components can use this hook to access and modify the global state
export const useAppContext = () => {
  return useContext(AppContext);
};
