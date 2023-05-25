function proxy_scheme() {
  console.info("(config)Got i2p:", getFuncName());
  return getFromStorageProxyScheme();
}
function proxy_host() {
  console.info("(config)Got i2p:", getFuncName());
  return getFromStorageHost();
}
function proxy_port() {
  console.info("(config)Got i2p:", getFuncName());
  return getFromStoragePort();
}

function control_host() {
  console.info("(config)Got i2p:", getFuncName());
  return getFromStorageControlHost();
}
function control_port() {
  console.info("(config)Got i2p:", getFuncName());
  return getFromStorageControlPort();
}

function rpc_host() {
  console.info("(config)Got i2p:", getFuncName());
  return getFromStorageRPCHost();
}
function rpc_port() {
  console.info("(config)Got i2p:", getFuncName());
  return getFromStorageRPCPort();
}
function rpc_path() {
  console.info("(config)Got i2p:", getFuncName());
  getFromStorageRPCPath();
}
function rpc_pass() {
  console.info("(config)Got i2p:", getFuncName());
  return getFromStorageRPCPass();
}

function bt_rpc_host() {
  console.info("(config)Got i2p:", getFuncName());
  return getFromStorageBTRPCHost();
}
function bt_rpc_port() {
  console.info("(config)Got i2p:", getFuncName());
  return getFromStorageBTRPCPort();
}
function bt_rpc_path() {
  console.info("(config)Got i2p:", getFuncName());
  return getFromStorageBTRPCPath();
}
function bt_rpc_pass() {
  console.info("(config)Got i2p:", getFuncName());
  return getFromStorageBTRPCPass();
}

function getFuncName() {
  return getFuncName.caller.name;
}

var disable_history = false;
