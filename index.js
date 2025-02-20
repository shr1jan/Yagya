import { AppRegistry } from 'react-native';
import App from './App'; // Import the root component (App.js)
import { name as appName } from './app.json'; // Import the app name from app.json

// Register the app component
AppRegistry.registerComponent(appName, () => App);