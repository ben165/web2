import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import PrimeVue from 'primevue/config'

// import CSS resources
import 'primevue/resources/primevue.min.css'            // core 
import 'primevue/resources/themes/saga-green/theme.css'  // theme
import 'primeicons/primeicons.css'                      // icons
import '/node_modules/primeflex/primeflex.css'          // PrimeFlex

import Button from 'primevue/button'
import Toolbar from 'primevue/toolbar'
import Panel from 'primevue/panel'
import ConfirmationService from 'primevue/confirmationservice';
import DialogService from 'primevue/dialogservice';
import Tooltip from 'primevue/tooltip';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import InputText from 'primevue/inputtext';
import Card from 'primevue/card';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Image from 'primevue/image';
import Avatar from 'primevue/avatar';
import Chip from 'primevue/chip';
import BadgeDirective from 'primevue/badgedirective';
import Badge from 'primevue/badge';
import ProgressSpinner from 'primevue/progressspinner';

const app = createApp(App);

app.use(PrimeVue);
app.use(ConfirmationService);
app.use(DialogService);
app.use(ToastService);

app.component('Button', Button);
app.component('Panel', Panel);
app.component('Toolbar', Toolbar);
app.component('InputGroup', InputGroup)
app.component('InputGroupAddon', InputGroupAddon)
app.component('InputText', InputText)
app.component('Card', Card)
app.component('Toast', Toast)
app.component('Image', Image)
app.component('Avatar', Avatar)
app.component('Chip', Chip)
app.component('Badge', Badge)
app.component('ProgressSpinner', ProgressSpinner)

app.directive('tooltip', Tooltip);
app.directive('badge', BadgeDirective);

app.mount('#app');
