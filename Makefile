.PHONY: build test

IMAGE_NAME?=gcr.io/elacity/media-uploader
TAG_FULL=$(shell git describe --tags)
PKG_VERSION=$(shell cat package.json | jq -r ".version")

build: fmt test
	npm run build

image: fmt
	docker build -f ci/images/Dockerfile -t $(IMAGE_NAME) .

gcr.push:
	docker tag $(IMAGE_NAME) $(IMAGE_NAME):$(PKG_VERSION) \
	&& docker push $(IMAGE_NAME) \
	&& docker push $(IMAGE_NAME):$(PKG_VERSION)

fmt:
	npx prettier "**/*.ts" --write

test:
	npm test -- --verbose	