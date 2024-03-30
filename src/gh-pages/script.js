const form = document.querySelector("form");
const formSubmit = form.querySelector("input[type=submit]");
const reposSection = document.querySelector(".repos-section");
const output = document.querySelector(".repos");

const firstLoadReposToggle = (function () {
  var executed = false;
  return function () {
    if (!executed) {
      executed = true;
      reposSection.style.display = "flex";
      console.log("Toggled repos section display");
    }
  };
})();

const requestOptions = {
  method: "GET",
  redirect: "follow",
};

const fetchTemplates = () => {
  fetch(`repo.html`, { cache: "force-cache" })
    .then((response) => response.text())
    .then((data) => {
      Sqrl.templates.define("repo", Sqrl.compile(data));
    });
  fetch("repos.html", { cache: "force-cache" })
    .then((response) => response.text())
    .then((data) => {
      Sqrl.templates.define("repos", Sqrl.compile(data));
      formSubmit.disabled = false;
      formSubmit.value = "Get Data";
    });
};

const handleSubmit = (e) => {
  firstLoadReposToggle();
  e.preventDefault();
  const data = new FormData(form);
  const user = data.get("user");
  const repo = data.get("repo");
  const url = new URL(
    repo
      ? `https://api.github.com/repos/${user}/${repo}`
      : `https://api.github.com/users/${user}/repos`
  );

  fetch(url, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      url.pathname.startsWith("/users")
        ? (output.innerHTML = Sqrl.render(
            `{{@include("repos", {data: it.data})/}}`,
            { data }
          ))
        : (output.innerHTML = Sqrl.render(
            `{{@include("repo", {repo: it.repo})/}}`,
            { repo: data }
          ));
    })

    .catch(() => {
      output.innerHTML = `<div class="error">
            <p>Something went wrong! Try checking if the inputs are correct</p>
          </div>`;
    })
    .finally(() => reposSection.scrollIntoView({ behavior: "smooth" }));
};

formSubmit.disabled = true;
formSubmit.value = "Loading...";
reposSection.style.display = "none";

fetchTemplates();

form.onsubmit = handleSubmit;
