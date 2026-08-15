export default {
  pages: [
    'pages/home/index',
    'pages/publish/index',
    'pages/publish-success/index',
    'pages/messages/index',
    'pages/detail/index',
    'pages/chat/index',
    'pages/want/index',
    'pages/want-detail/index',
    'pages/favorites/index',
    'pages/request-publish/index',
    'pages/mine/index',
  ],
  window: {
    navigationBarBackgroundColor: '#F5F5F3',
    navigationBarTextStyle: 'black',
    navigationBarTitleText: '邻里闲置',
    backgroundColor: '#F5F5F3',
    backgroundTextStyle: 'light',
  },
  permission: {
    'scope.userLocation': {
      desc: '用于显示闲置与您的距离',
    },
  },
  requiredPrivateInfos: ['getLocation', 'chooseLocation'],
}
