import './check-network-state.css';

function CheckNetworkState({ onNetworkState }) {
  window.ononline = () => {
    onNetworkState(true);
  };
  window.onoffline = () => {
    onNetworkState(false);
  };
}

export default CheckNetworkState;
