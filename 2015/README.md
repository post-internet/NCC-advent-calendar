# Simple Advent Calendar
[Adventar](http://www.adventar.org)風のページを静的Webサーバ（Github Pagesなど）で配信できます

[サンプルページはこちら](http://3846masa.github.io/simpleAdventCalendar/)

Google SpreadSheet でデータを管理します

個人で簡単にAdvent Calendarが作れます

## How to use (on Github Pages)

### 1. Google SpreadSheetを作る
- [参考スプレッドシート](https://docs.google.com/spreadsheets/d/1CPU7pX9fOojYvLYzT6SrT1mrzs_dy2ZxTJOs6L_zgBM/edit?usp=sharing)
- 1行目は同じものを書く
  - 間違えると動かない
- 日付がパースできない行は無視される
  - 日付が空欄の行も無視される
- ``thumbnail_type``によってアイコンの取得方法が違う
  - ``none``, ``twitter``, ``gravatar``, ``hatena``, ``qiita``, ``github``, ``facebook``, ``url``
  - APIの制限があるため，極力URL指定がよい
  - ``qiita``はAPI制限が厳しいので避けたほうがよい
- ``thumbnail_id``は任意
  - ``facebook``の場合はidを入れる必要がある
  - ``url``の場合はここにURLを記入する

### 2. SpreadSheetをウェブに公開
- [Googleのヘルプ](https://support.google.com/docs/answer/37579?hl=ja&ref_topic=2818999)
- **共有ではない** ので注意

### 3. このレポジトリを[fork](https://github.com/3846masa/simpleAdventCalendar/fork)
- [ここからforkできる](https://github.com/3846masa/simpleAdventCalendar/fork)

### 4. ``index.html``を編集
- タイトルなどを編集
- ``<meta name="spreadsheet" content="">``にSpreadSheetのIDを入れる
  - SpreadSheetのURLに含まれている文字列
  - 例）``1CPU7pX9fOojYvLYzT6SrT1mrzs_dy2ZxTJOs6L_zgBM``
- [meta情報やOGP情報，TwitterCard情報を作る](http://webcodetools.com/)
- [共有ボタンを設置する](http://www.ninja.co.jp/omatome/)

### 5. （任意）CNAMEファイル
- 独自ドメインを貼りたい人はCNAMEファイルを作る
- 詳しくは[こちら（英語）](https://help.github.com/articles/setting-up-a-custom-domain-with-github-pages/)

## LICENSE
[MIT (c) 3846masa](http://3846masa.mit-license.org/2015)
