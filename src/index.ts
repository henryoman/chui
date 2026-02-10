import {
  BoxRenderable,
  createCliRenderer,
  InputRenderableEvents,
  LayoutEvents,
  TextRenderable,
  type CliRenderer,
} from "@opentui/core";
import { upsertByUsername } from "./data/user_repository.js";
import { createHomeView, createLoginView, createSplashView } from "./ui/components/index.js";
import {
  colors,
  getViewportConstraintMessage,
  isViewportSupported,
  spacing,
} from "./ui/design/index.js";

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  targetFps: 30,
});

type AppRoute = "splash" | "login" | "home";

const homeView = createHomeView(renderer);
const minSizeView = createMinSizeView(renderer);
let activeRoute: AppRoute = "splash";

const renderCurrentRoute = () => {
  removeIfPresent(renderer, "splash");
  removeIfPresent(renderer, "login");
  removeIfPresent(renderer, "home");
  removeIfPresent(renderer, "min-size");

  if (!isViewportSupported(renderer.width, renderer.height)) {
    minSizeView.setSize(renderer.width, renderer.height);
    renderer.root.add(minSizeView.view);
    return;
  }

  if (activeRoute === "splash") {
    renderer.root.add(splashView.view);
    return;
  }

  if (activeRoute === "login") {
    renderer.root.add(loginView.view);
    loginView.input.focus();
    return;
  }

  renderer.root.add(homeView.view);
};

const showHome = () => {
  activeRoute = "home";
  renderCurrentRoute();
};

let isSubmitting = false;

let loginView: ReturnType<typeof createLoginView>;

const handleLogin = async (value: string) => {
  if (isSubmitting) {
    return;
  }

  const username = value ?? "";
  loginView.setStatus("Saving/Loading...", "#FBBF24");
  isSubmitting = true;

  try {
    const result = await upsertByUsername(username);
    loginView.setStatus(
      `Logged in as ${result.username} (${result.userId})`,
      "#34D399",
    );
    showHome();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    loginView.setStatus(message, "#F87171");
  } finally {
    isSubmitting = false;
  }
};

loginView = createLoginView(renderer, {
  onSubmit: handleLogin,
});

const showLogin = () => {
  activeRoute = "login";
  renderCurrentRoute();
};

const splashView = createSplashView(renderer, { onEnter: showLogin });

renderer.root.on(LayoutEvents.RESIZED, renderCurrentRoute);
renderCurrentRoute();

loginView.input.on(InputRenderableEvents.ENTER, handleLogin);

function removeIfPresent(renderer: CliRenderer, id: string) {
  if (renderer.root.getRenderable(id)) {
    renderer.root.remove(id);
  }
}

function createMinSizeView(renderer: CliRenderer) {
  const view = new BoxRenderable(renderer, {
    id: "min-size",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
    flexDirection: "column",
    gap: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
  });

  const title = new TextRenderable(renderer, {
    content: "Resize Terminal",
    fg: colors.yellow,
  });
  const details = new TextRenderable(renderer, {
    content: getViewportConstraintMessage(renderer.width, renderer.height),
    fg: colors.gray300,
    wrapMode: "word",
  });

  view.add(title);
  view.add(details);

  return {
    view,
    setSize: (width: number, height: number) => {
      details.content = getViewportConstraintMessage(width, height);
    },
  };
}
