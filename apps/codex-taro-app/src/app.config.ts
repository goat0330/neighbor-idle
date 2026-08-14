export default {
  pages: [
    'pages/home/index',
    'pages/publish/index',
    'pages/messages/index',
    'pages/detail/index',
    'pages/chat/index',
    'pages/want/index',
    'pages/request-publish/index',
    'pages/mine/index',
    'pages/cover/index',
    'pages/map-demo/index',
  ],
  window: {
    navigationBarBackgroundColor: '#F7F5EF',
    navigationBarTextStyle: 'black',
    navigationBarTitleText: '邻里集市',
    backgroundColor: '#F7F5EF',
    backgroundTextStyle: 'light',
  },
  permission: {
    'scope.userLocation': {
      desc: '用于显示闲置与您的距离',
    },
  },
  requiredPrivateInfos: ['getLocation', 'chooseLocation'],
  tabBar: {
    color: '#7B817C',
    selectedColor: '#EB8055',
    backgroundColor: '#FFFDF8',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/home/index', text: '附近' },
      { pagePath: 'pages/publish/index', text: '卖闲置' },
      { pagePath: 'pages/messages/index', text: '消息' },
    ],
  },
}
