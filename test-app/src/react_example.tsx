import React from 'react';
import { createRoot } from 'react-dom/client';
import { BasicTriangle } from '../../src/stories/Examples/Triangle';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<BasicTriangle />);
