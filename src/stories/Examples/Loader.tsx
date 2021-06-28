import React from 'react'
import regl, { ReglFrame } from '../../';
import { ImageLoader } from './ImageLoader';
import { ImageLoaderFlipY } from './ImageLoaderFlipY';

export const Loader = () => {
  return (
    <>
      <ImageLoader />
      <ImageLoaderFlipY />
    </>
  );
}
