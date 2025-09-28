"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const hardhat_1 = __importDefault(require("hardhat"));
const network_helpers_1 = require("@nomicfoundation/hardhat-toolbox/network-helpers");
require("@nomicfoundation/hardhat-chai-matchers");
describe("WhisprChat", function () {
    async function deployChatFixture() {
        const [owner, user1, user2, user3] = await hardhat_1.default.ethers.getSigners();
        const WhisprChat = await hardhat_1.default.ethers.getContractFactory("WhisprChat");
        const chat = await WhisprChat.deploy();
        return { chat, owner, user1, user2, user3 };
    }
    describe("Group Chat", function () {
        it("Should create a group", async function () {
            const { chat, user1 } = await (0, network_helpers_1.loadFixture)(deployChatFixture);
            const groupName = "Test Group";
            await (0, chai_1.expect)(chat.connect(user1).createGroup(groupName))
                .to.emit(chat, "GroupCreated")
                .withArgs(1, groupName, user1.address);
            const group = await chat.groups(1);
            (0, chai_1.expect)(group[1]).to.equal(groupName); // name is index 1
            (0, chai_1.expect)(group[2]).to.include(user1.address); // members is index 2
        });
        it("Should add member to group", async function () {
            const { chat, user1, user2 } = await (0, network_helpers_1.loadFixture)(deployChatFixture);
            await chat.connect(user1).createGroup("Test Group");
            await (0, chai_1.expect)(chat.connect(user1).addMember(1, user2.address))
                .to.emit(chat, "MemberAdded")
                .withArgs(1, user2.address);
            const members = await chat.getGroupMembers(1);
            (0, chai_1.expect)(members).to.include(user1.address);
            (0, chai_1.expect)(members).to.include(user2.address);
        });
        it("Should not allow non-creator to add members", async function () {
            const { chat, user1, user2, user3 } = await (0, network_helpers_1.loadFixture)(deployChatFixture);
            await chat.connect(user1).createGroup("Test Group");
            await (0, chai_1.expect)(chat.connect(user2).addMember(1, user3.address)).to.be.rejectedWith("Not group creator");
        });
        it("Should remove member from group", async function () {
            const { chat, user1, user2 } = await (0, network_helpers_1.loadFixture)(deployChatFixture);
            await chat.connect(user1).createGroup("Test Group");
            await chat.connect(user1).addMember(1, user2.address);
            await (0, chai_1.expect)(chat.connect(user1).removeMember(1, user2.address))
                .to.emit(chat, "MemberRemoved")
                .withArgs(1, user2.address);
            const members = await chat.getGroupMembers(1);
            (0, chai_1.expect)(members).to.not.include(user2.address);
        });
        it("Should send group message", async function () {
            const { chat, user1 } = await (0, network_helpers_1.loadFixture)(deployChatFixture);
            await chat.connect(user1).createGroup("Test Group");
            const message = "Hello World";
            await (0, chai_1.expect)(chat.connect(user1).sendGroupMessage(1, message))
                .to.emit(chat, "GroupMessageSent")
                .withArgs(1, user1.address, message);
            const messages = await chat.getGroupMessages(1, 0, 10);
            (0, chai_1.expect)(messages.length).to.equal(1);
            (0, chai_1.expect)(messages[0].sender).to.equal(user1.address);
            (0, chai_1.expect)(messages[0].content).to.equal(message);
        });
        it("Should not allow non-members to send messages", async function () {
            const { chat, user1, user2 } = await (0, network_helpers_1.loadFixture)(deployChatFixture);
            await chat.connect(user1).createGroup("Test Group");
            await (0, chai_1.expect)(chat.connect(user2).sendGroupMessage(1, "Hello")).to.be.rejectedWith("Not a group member");
        });
        it("Should paginate group messages", async function () {
            const { chat, user1 } = await (0, network_helpers_1.loadFixture)(deployChatFixture);
            await chat.connect(user1).createGroup("Test Group");
            for (let i = 0; i < 5; i++) {
                await chat.connect(user1).sendGroupMessage(1, `Message ${i}`);
            }
            const messages = await chat.getGroupMessages(1, 1, 2);
            (0, chai_1.expect)(messages.length).to.equal(2);
            (0, chai_1.expect)(messages[0].content).to.equal("Message 1");
            (0, chai_1.expect)(messages[1].content).to.equal("Message 2");
        });
    });
    describe("Private Chat", function () {
        it("Should send private message", async function () {
            const { chat, user1, user2 } = await (0, network_helpers_1.loadFixture)(deployChatFixture);
            const message = "Private Hello";
            await (0, chai_1.expect)(chat.connect(user1).sendPrivateMessage(user2.address, message))
                .to.emit(chat, "PrivateMessageSent")
                .withArgs(user1.address, user2.address, message);
            const messages = await chat.connect(user1).getPrivateMessages(user2.address, 0, 10);
            (0, chai_1.expect)(messages.length).to.equal(1);
            (0, chai_1.expect)(messages[0].sender).to.equal(user1.address);
            (0, chai_1.expect)(messages[0].content).to.equal(message);
        });
        it("Should retrieve messages from both sides", async function () {
            const { chat, user1, user2 } = await (0, network_helpers_1.loadFixture)(deployChatFixture);
            await chat.connect(user1).sendPrivateMessage(user2.address, "From 1 to 2");
            await chat.connect(user2).sendPrivateMessage(user1.address, "From 2 to 1");
            const messages1 = await chat.connect(user1).getPrivateMessages(user2.address, 0, 10);
            const messages2 = await chat.connect(user2).getPrivateMessages(user1.address, 0, 10);
            (0, chai_1.expect)(messages1.length).to.equal(2);
            (0, chai_1.expect)(messages2.length).to.equal(2);
        });
        it("Should paginate private messages", async function () {
            const { chat, user1, user2 } = await (0, network_helpers_1.loadFixture)(deployChatFixture);
            for (let i = 0; i < 5; i++) {
                await chat.connect(user1).sendPrivateMessage(user2.address, `Message ${i}`);
            }
            const messages = await chat.connect(user1).getPrivateMessages(user2.address, 2, 2);
            (0, chai_1.expect)(messages.length).to.equal(2);
            (0, chai_1.expect)(messages[0].content).to.equal("Message 2");
            (0, chai_1.expect)(messages[1].content).to.equal("Message 3");
        });
    });
});
