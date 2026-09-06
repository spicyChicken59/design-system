import * as React from 'react';
import { StatStrip, Stat } from '@spicychicken/react';
export const LeadMetric = () => <StatStrip columns={2}><Stat label="lowest asking" value="$42,600" note="Illustrative · before fees" lead /><Stat label="compared" value="74" note="Example listings" /></StatStrip>;
