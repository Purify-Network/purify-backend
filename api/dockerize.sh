docker build . -t purify_server
docker stop purify_server_container
docker rm purify_server_container
docker run --network=host --name purity_server_container -p 49160:3004 -d purify_server
