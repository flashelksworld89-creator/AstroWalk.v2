import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error) { console.error('AstroWalk could not render:', error); }
  render() {
    if (!this.state.error) return this.props.children;
    return <main className="recovery-panel" role="alert">
      <h1>AstroWalk couldn’t open this view</h1>
      <p>Your saved definitions have not been removed. Reload to try again.</p>
      <button className="primary-button" onClick={() => window.location.reload()}>Reload AstroWalk</button>
      <details><summary>Error details</summary><pre>{this.state.error.message || String(this.state.error)}</pre></details>
      <small>AstroWalk 2.0</small>
    </main>;
  }
}
