export default {
  pages: [
    'pages/cover/index',
    'pages/map-demo/index',
    'pages/home/index',
    'pages/want/index',
    'pages/publish/index',
    'pages/messages/index',
    'pages/chat/index',
    'pages/detail/index',
    'pages/mine/index',
    'pages/request-publish/index',
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
      { pagePath: 'pages/home/index', text: '附近闲置' },
      { pagePath: 'pages/want/index', text: '求购广场' },
      { pagePath: 'pages/publish/index', text: '发布' },
      { pagePath: 'pages/messages/index', text: '消息' },
      { pagePath: 'pages/mine/index', text: '我的' },
    ],
  },
}
