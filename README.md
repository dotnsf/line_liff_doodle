# Line LIFF Doodle

## Overview

Sample Application for LIFF(LIne Front-end Framework), which can upload your doodle in your LINE message.

(2020.Jan.23)LIFF v2.1 enabled.


## Pre-requisite

- LINE account

- LINE Developer account

    - https://developers.line.biz/ja/

- LIFF application in LINE Channel ( as Messaging API )

    - Application size need to be **tall** or **full**.

    - Scopes need to include both **chat_message.write** and **profile**.

    - Find your LIFF URL(line://app/{liff_id}) for later use.

- Public application server for Node.js

    - I would describe followings as you use IBM Cloud for this environment.


## Pre-requisite for IBM Cloud user

- Node.js runtime

- IBM Cloudant

    - Create one database named **doodledb**


## Install

- Download source from github.com

    - https://github.com/dotnsf/line_liff_doodle.git

- Edit settings.js with following information:

    - exports.db_username : username for IBM Cloudant

    - exports.db_password : password for IBM Cloudant

    - exports.liff_id : liff_id which is assigned when you create LIFF app.

- Deploy application into IBM Cloud

- Set endpoint URL in you LIFF application setting, and get LIFF URL(line://app/XXXXXX..)

- Paste LIFF URL or Web URL(https://liff.line.me/{liff_id}) as your LINE message, and click that URL.



## Links

- LIFF

    - https://developers.line.me/ja/docs/liff/overview/

- LIFF API References

    - https://developers.line.biz/ja/reference/liff/


## Copyright

2018-2020 [K.Kimura @ Juge.Me](https://github.com/dotnsf) all rights reserved.
