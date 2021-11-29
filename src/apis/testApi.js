const url = "/api";

export const TestApi = {
  get() {
    return this.$http.get(`${url}/data-platform-uaa/auth/code`).then((response) => {
        console.log(response);
    })
  },
};
