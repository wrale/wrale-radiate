FROM rust:1.74 as builder

WORKDIR /usr/src/app
COPY . .

RUN cargo build --release

FROM debian:bookworm-slim
COPY --from=builder /usr/src/app/target/release/wrale-radiate-server /usr/local/bin/

CMD ["wrale-radiate-server"]
