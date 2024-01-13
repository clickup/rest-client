import { RestClient } from "..";
import substituteParams from "../internal/substituteParams";

test("fetch_plain_url", async () => {
  const client = new RestClient();
  const res = await client.get("http://example.com", undefined, "*/*").text();
  expect(res.length).toBeGreaterThan(10);
});

test("fetch_loopback_url_fails", async () => {
  const client = new RestClient();
  await expect(client.get("http://localhost/abc").response()).rejects.toThrow(
    new RegExp(
      "^Domain localhost resolves to a non-public \\(loopback\\) IP address (127\\.0\\.0\\.1)|(\\:\\:1)",
    ),
  );
});

test("fetch_private_url_fails", async () => {
  const client = new RestClient();
  await expect(client.get("http://10.0.0.1/abc").response()).rejects.toThrow(
    "Domain 10.0.0.1 resolves to a non-public (private) IP address 10.0.0.1",
  );
});

test("fetch_url_with_redirect_fails", async () => {
  const client = new RestClient();
  await expect(client.get("http://google.com").response()).rejects.toThrow(
    /redirect mode is set to error:/,
  );
});

test("fetch_relative_url_fails", async () => {
  const client = new RestClient();
  await expect(client.get("/test").text()).rejects.toThrow(/Invalid URL/);
  await expect(client.get("zzz").text()).rejects.toThrow(/Invalid URL/);
});

test("substituteParams", async () => {
  const body = { aa: "aaa", b: 42, x: "y" };
  expect(substituteParams("/some/:aa/other/:b/ccc/:ddd/eee", body)).toEqual([
    "/some/aaa/other/42/ccc/:ddd/eee",
    { x: "y" },
  ]);
  expect(body).toEqual({ aa: "aaa", b: 42, x: "y" });
});

test("withOptions ignores undefined", async () => {
  const request = new RestClient({ timeoutMs: 1234 })
    .withOptions({ timeoutMs: undefined })
    .writeJson("/", "");
  expect(request.options.timeoutMs).toEqual(1234);
});
