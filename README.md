# 调度画布

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```
## common 文件夹为公共模块，采用subtree引入，改动会影响其他模块，请谨慎改动common文件夹下的内容

### 拉取最新的common文件(需要保证本地项目没有可以提交的改动， 不然会报错)
```
git subtree pull --prefix=common http://xxxx/common.git master --squash
```
