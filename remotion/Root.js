import {Composition} from 'remotion';
import {BabyStepsPromo} from './PromoVideo';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="BabyStepsPromo"
        component={BabyStepsPromo}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
