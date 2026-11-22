import { useEffect, useRef, useState } from 'react';

const CHANNEL_NAME = 'spelling-bee-sync';

// The Teacher window calls this to send state
export const useTeacherSync = () => {
  const channelRef = useRef(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    return () => {
      channelRef.current.close();
    };
  }, []);

  const broadcastState = (state) => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'STATE_UPDATE', payload: state });
    }
  };

  return { broadcastState };
};

// The Student window calls this to receive state
export const useStudentSync = (initialState) => {
  const [syncedState, setSyncedState] = useState(initialState);

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    
    channel.onmessage = (event) => {
      if (event.data.type === 'STATE_UPDATE') {
        setSyncedState(event.data.payload);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  return syncedState;
};
