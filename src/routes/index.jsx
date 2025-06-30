import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PrivateRoute from '@/components/PrivateRoute/PrivateRoute';

const HomePage = lazy(() => import('../pages/Home/HomePage'));
const FlightSearchPage = lazy(() => import('../pages/FlightSearch/index'));
const MyBookingsPage = lazy(() => import('../pages/MyBookings/componets'));
const BookingDetail = lazy(() => import('../pages/Booking/BookingDetail/index'));
const BookingDetailView = lazy(() => import('../pages/Booking/BookingDetailView/index'));
const LoginDialog = lazy(() => import('../pages/Login/LoginDialog'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage404'));
const FlightList = lazy(() => import('../pages/FlightSearch/components/FlightList'));
const SelectTest = lazy(() => import('../components/ui/Select/SelectTest'));
const ModalExample = lazy(() => import('../components/ui/Modal/ModalExample'));
const BookingConfirmation = lazy(() => import('../pages/Booking/BookingConfirmation'));
const BookingSuccess = lazy(() => import('../pages/Booking/BookingSuccess'));

// 创建一个普通组件包装器
const lazyLoad = (Component) => {
  return (
    <MainLayout>
      <Component />
    </MainLayout>
  );
};

// 创建一个需要认证的组件包装器
const privateLoad = (Component) => {
  return (
    <MainLayout>
      <PrivateRoute>
        <Component />
      </PrivateRoute>
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
        element: privateLoad(MyBookingsPage)
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
        path: '/my-bookings/confirm',
        element: privateLoad(BookingConfirmation)
    },
    {
        name: 'bookingSuccess',
        path: '/my-bookings/success',
        element: privateLoad(BookingSuccess)
    },
    {
        name: 'bookingDetail',
        path: '/my-bookings/detail',
        element: privateLoad(BookingDetail)
    },
    {
        name: 'bookingDetailView',
        path: '/my-bookings/detail-view',
        element: privateLoad(BookingDetailView)
    },
    {
        name: '404',
        path: '*',
        element: lazyLoad(NotFoundPage)
    }
];

export default routes;
