import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

const HomePage = lazy(() => import('../pages/Home/HomePage'));
const FlightSearchPage = lazy(() => import('../pages/FlightSearch/index'));
const MyBookingsPage = lazy(() => import('../pages/MyBookingsPage'));
const LoginDialog = lazy(() => import('../pages/Login/LoginDialog'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage404'));
const FlightList = lazy(() => import('../pages/FlightSearch/components/FlightList'));
const SelectTest = lazy(() => import('../components/ui/Select/SelectTest'));
const ModalExample = lazy(() => import('../components/ui/Modal/ModalExample'));
const BookingConfirmation = lazy(() => import('../pages/Booking/BookingConfirmation'));
const BookingSuccess = lazy(() => import('../pages/Booking/BookingSuccess'));

// 创建一个组件包装器
const lazyLoad = (Component) => {
  return (
    <MainLayout>
      <Component />
    </MainLayout>
  );
};

const routes = [
    {
        path: '/',
        element: <Navigate to="/home" />
    },
    {
        name: 'home',
        path: '/home',
        element: lazyLoad(HomePage)
    },
    {
        name: 'flightSearch',
        path: '/flightSearch',
        element: lazyLoad(FlightSearchPage)
    },
    {
        name: 'my bookings',
        path: '/my-bookings',
        element: lazyLoad(MyBookingsPage)
    },
    {
        name: 'login',
        path: '/login',
        element: lazyLoad(LoginDialog)
    },
    {
        name: 'flightlist',
        path: '/flightlist',
        element: lazyLoad(FlightList)
    },
    {
        name: 'selectTest',
        path: '/select-test',
        element: lazyLoad(SelectTest)
    },
    {
        name: 'modaltest',
        path: '/modal-test',
        element: lazyLoad(ModalExample)
    },
    {
        name: 'bookingConfirmation',
        path: '/booking/confirm',
        element: lazyLoad(BookingConfirmation)
    },
    {
        name: 'bookingSuccess',
        path: '/booking/success',
        element: lazyLoad(BookingSuccess)
    },
    {
        name: '404',
        path: '*',
        element: lazyLoad(NotFoundPage)
    }
];

export default routes;
