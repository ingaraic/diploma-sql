
import Lottie from "lottie-react";
import fallingMeteor from '../animations/Meteor.json';

const FullscreenLottie = () => {
  return (
    <div className="lottie-overlay">
      <Lottie animationData={fallingMeteor} loop={true} />
    </div>
  );
};

export default FullscreenLottie;
