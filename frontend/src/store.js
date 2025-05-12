import { create } from 'zustand';

export const useCalendarStore = create((set) => ({
  selectedDate: new Date(),
  timeSlots: {},
  selectedJob: null,
  isManagement: true,
  slotDuration: 30,
  userEmail:null,
  pastSlot:'',
  
  jobs: [
    { id: '1', title: 'Frontend Developer' },
    { id: '2', title: 'Backend Developer' },
    { id: '3', title: 'UI/UX Designer' },
  ],

  setIsManagement: (value) => set({ isManagement: value }),
  setUserEmail: (value) => set({ userEmail: value }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setPastSlot: (val) => set({ pastSlot: val }),



fetchTimeSlots: async (jobid) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    try {
      // Fetch the slots for the specified jobid
      const response = await fetch(`${API_BASE_URL}/getSlots?jobid=${jobid}`);
      if (response.ok) {
        const data = await response.json();

        // Normalize the data by changing `jobid` to `jobId` and organize by date
        const organizedSlots = data.reduce((acc, slot) => {
          // Normalize jobid to jobId
          const normalizedSlot = {
            ...slot,
            endTime: slot.endtime,
            startTime: slot.starttime,
            jobId: slot.jobid,
            isSelected: slot.isselected,  // Normalize the field
            // Optionally remove the old jobid field
          };
          delete normalizedSlot.endtime;
          delete normalizedSlot.starttime;
          delete normalizedSlot.jobid;
          delete normalizedSlot.isselected;


          // Extract date from the slot id (assumes id format is 'YYYY-MM-DD-HH:MM-JobId')
          const slotDate = normalizedSlot.id.split('-').slice(0, 3).join('-'); // 'YYYY-MM-DD'

          // Add slot to the corresponding date in the accumulator
          if (!acc[slotDate]) {
            acc[slotDate] = [];  // If the date is not in the accumulator, initialize it as an empty array
          }
          acc[slotDate].push(normalizedSlot);  // Add the current slot to the correct date's array

          return acc;
        }, {});

        console.log('Fetched and Normalized Slots:', organizedSlots);

        // Update the state with the organized slots
        set({ timeSlots: organizedSlots });
      } else {
        console.error('Failed to fetch time slots');
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  },


addTimeSlot: (date, slot) => set(async (state) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    // First update the state synchronously
    const newTimeSlots = {
      ...state.timeSlots,
      [date]: [...(state.timeSlots[date] || []), slot],
    };

    console.log('Added Slot:', slot);
    console.log('Updated Time Slots:', newTimeSlots);

    // Return the new timeSlots synchronously
    set({ timeSlots: newTimeSlots });
    console.log(newTimeSlots)
    try {
       fetch(`${API_BASE_URL}/addSlot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slot),
      });
    } catch (error) {
      console.error('Error adding time slot:', error);
    }
  }),

removeTimeSlot: (date, slotId) => set(async (state) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
    // First update the state synchronously, filter out the slot locally
    const newTimeSlots = {
      ...state.timeSlots,
      [date]: (state.timeSlots[date] || []).filter((slot) => slot.id !== slotId),
    };

    console.log('Removed Slot ID:', slotId);
    console.log('Updated Time Slots:', newTimeSlots);

    // Update the state with the new timeSlots
    set({ timeSlots: newTimeSlots });

    // Now, make the API call to remove the slot from the backend
    try {
      await fetch(`${API_BASE_URL}/removeSlot/${slotId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ id: slotId }),  // Send the slot ID for removal
      });

    } catch (error) {
      console.error('Error removing time slot:', error);
      // Optionally, you can reset the state or handle errors if needed
    }

    // Return the new state after successful API call (no further changes to state)
    return {};
  }),


  selectTimeSlot: (date, slotId, userId) => set(async (state) => {
    console.log(date, slotId, userId)
    const dateSlots = state.timeSlots[date] || [];
    // const hasSelectedSlot = dateSlots.some(slot => slot.selectedBy === userId);
    const hasSelectedSlot = Object.values(state.timeSlots).some(dateSlots => 
      dateSlots.some(slot => slot.selectedBy === userId)
    );
    // Get the current time and slot's start time
    const now = new Date();
    const slotTime = new Date(`${date}T${hasSelectedSlot.startTime}:00`); // Create a Date object for the slot time

    // Add condition to only proceed if the slot time is in the future
    console.log(slotTime,now,hasSelectedSlot,dateSlots)
    if (slotTime <= now) {

      return;}
      console.log("hfrjgfudjfkdjfkdsls")
      set({ pastSlot: false });
      console.log(state.pastSlot)
    // Update local timeSlots state
    const newTimeSlots = {
      ...state.timeSlots,
      [date]: dateSlots.map((slot) => {
        if (slot.id === slotId) {
          // If the slot is already selected by this user, unselect it
          if (slot.selectedBy === userId) {
            return { ...slot, isSelected: false, selectedBy: 'Talha' };
          }
          // If the user has already selected another slot, don't allow selection
          if (hasSelectedSlot) {
            return slot;
          }
          // Select the slot
          return { ...slot, isSelected: true, selectedBy: userId };
        }
        return slot;
      }),
    };

    // Call the API to update the slot selection in the database
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/selectSlot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: slotId, email:userId }),
      });
      if (!response.ok) {
        throw new Error('Error selecting/unselecting slot');
      }

      // Update the state with the new timeSlots
      set({ timeSlots: newTimeSlots });
      set({ pastSlot: 'Slot added successfully' });

      window.location.reload();
    } catch (error) {
      if (error.response){
        console.log(error.response.status)
      }
      set({ pastSlot: 'Select a valid slot or slot has already selected'});

    }

    // Return the updated timeSlots state
    return {};
  }),


  setSelectedJob: (job) => set({ selectedJob: job }),
  toggleUserType: () => set((state) => ({ isManagement: state.isManagement })),
  setSlotDuration: (duration) => set({ slotDuration: duration }),
}));