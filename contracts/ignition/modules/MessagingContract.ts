import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MessagingModule = buildModule("MessagingModule", (m) => {
  const messagingContract = m.contract("MessagingContract", []);

  return { messagingContract };
});

export default MessagingModule;
