#!/bin/sh
# 本地开发：初始化 D1 数据库表结构
# 使用方法: cd worker && sh init-local-db.sh
npx wrangler d1 execute kiddo-plan-db --local --file=./schema.sql
