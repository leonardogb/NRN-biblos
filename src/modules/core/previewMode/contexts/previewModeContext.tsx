import React from 'react';
import { PreviewData } from '../types/PreviewData';

export type PreviewModeContext = {
  isPreviewModeEnabled: boolean;
  previewData: PreviewData;
}

/**
 * Uses native React Context API
 *
 * @example Usage
 *  import previewModeContext from './src/stores/previewModeContext';
 *  const { preview, previewData }: PreviewModeContext = React.useContext(previewModeContext);
 *
 * @see https://reactjs.org/docs/context.html
 * @see https://medium.com/better-programming/react-hooks-usecontext-30eb560999f for useContext hook example (open in anonymous browser #paywall)
 */
export const previewModeContext = React.createContext<PreviewModeContext>({
  isPreviewModeEnabled: false,
  previewData: {}
});

export default previewModeContext;
