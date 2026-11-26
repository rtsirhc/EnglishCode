import { useEffect, useRef, useState } from 'react';

const CHANNEL_NAME = 'englishcode:sudden-death-spelling-bee:display:v1';

// The Teacher window calls this to send state
export const useTeacherSync = (room) => {
  const channelRef = useRef(null);
  const latestRef = useRef(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME + ':' + room);
    channelRef.current.onmessage = event => {
      if (event.data?.type === 'REQUEST_STATE' && latestRef.current) channelRef.current?.postMessage({ type: 'STATE_UPDATE', payload: latestRef.current });
    };
    return () => {
      channelRef.current.postMessage({ type: 'STATE_UPDATE', payload: {phase: 'setup'} });
      channelRef.current.close();
    };
  }, [room]);

  const broadcastState = (state) => {
    latestRef.current = state;
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'STATE_UPDATE', payload: state });
    }
  };

  return { broadcastState };
};

// The Student window calls this to receive state
export const useStudentSync = (initialState, room) => {
  const [syncedState, setSyncedState] = useState(initialState);

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME + ':' + room);
    
    channel.onmessage = (event) => {
      if (event.data.type === 'STATE_UPDATE') {
        setSyncedState(event.data.payload);
      }
    };

    channel.postMessage({ type: 'REQUEST_STATE' });
    return () => {
      channel.close();
    };
  }, [room]);

  return syncedState;
};
