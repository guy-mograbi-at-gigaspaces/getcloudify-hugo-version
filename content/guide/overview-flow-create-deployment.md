---


layout: bt_wiki
title: The Deployment Creation Flow
category: Product Overview
publish: true
abstract: Describes the flow of creating a deployment for an existing Blueprint
pageord: 500
---


{{% gsSummary %}}

![Cloudify Create Deployment](/images/3.2.0/architecture/cloudify_flow_create_deployment.png)

* The REST service will retrieve the blueprint document from Elasticsearch and create a "phyical" manifestation of it by expanding nodes to node-instances, attaching node-instance ID's to them, and so forth.
