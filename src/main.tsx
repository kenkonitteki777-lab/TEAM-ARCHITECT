import { Component, StrictMode, useEffect, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './command-room.css';
import './components/execution.css';
import './components/practical.css';
import './components/mbti.css';

class StartupBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){const shell=document.getElementById('startup');if(shell){shell.hidden=false;shell.querySelector('h1')!.textContent='画面の表示中に問題が発生しました';document.getElementById('startup-code')!.textContent='読込段階：JS到達 ／ 画面描画失敗';}}
  render(){return this.state.failed?null:this.props.children;}
}
function ReadyApp(){
 useEffect(()=>{const shell=document.getElementById('startup');if(shell)shell.hidden=true;},[]);
 return <App/>;
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StartupBoundary><ReadyApp /></StartupBoundary>
  </StrictMode>
);

