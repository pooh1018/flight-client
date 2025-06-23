import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

// 创建一个高阶组件，将 React Router v6 的 hooks 功能传递给类组件
export function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    let navigate = useNavigate();
    let location = useLocation();
    let params = useParams();

    return (
      <Component
        {...props}
        navigate={navigate}
        location={location}
        params={params}
      />
    );
  }

  return ComponentWithRouterProp;
}

export default withRouter;
