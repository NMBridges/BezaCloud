const {
    CreateTagsCommand,
    RunInstancesCommand,
    EC2Client,
    DescribeInstancesCommand,
    StartInstancesCommand,
    StopInstancesCommand,
    RebootInstancesCommand,
    TerminateInstancesCommand,
} = require("@aws-sdk/client-ec2");
var ec2Client = new EC2Client({ region: "us-east-1"});

/**
 * Tests to see if the AWS credentials are valid
 */
const connectionTest = async () => {
    try {
        ec2Client = new EC2Client({ region: "us-east-1"});
        const data = await ec2Client.send(new DescribeInstancesCommand({}));
        console.log("Login successful");
        return true;
    } catch(err) {
        console.log("Error loggin in", err);
        return false;
    }
};

/**
 * Starts a server with a specified instance ID.
 * @param {string} instanceId The instance ID of the server to start.
 * @returns Whether or not the starting of the server was successful.
 */
const startInstance = async (instanceId) => {
    try {
        ec2Client = new EC2Client({ region: "us-east-1"});
        const data = await ec2Client.send(new StartInstancesCommand({InstanceIds: [instanceId], DryRun: false}));
        console.log("Starting server successful");
        return true;
    } catch(err) {
        console.log("Error starting server", err);
        return false;
    }
}

/**
 * Stop a server with a specified instance ID.
 * @param {string} instanceId The instance ID of the server to stop.
 * @returns Whether or not the stopping of the server was successful.
 */
const stopInstance = async (instanceId) => {
    try {
        ec2Client = new EC2Client({region: "us-east-1"});
        const data = await ec2Client.send(new StopInstancesCommand({InstanceIds: [instanceId], DryRun: false}));
        console.log("Stopping server successful");
        return true;
    } catch(err) {
        console.log("Error starting server", err);
        return false;
    }
}

/**
 * Reboot a server with a specified instance ID.
 * @param {string} instanceId The instance ID of the server to reboot.
 * @returns Whether or not the rebooting of the server was successful.
 */
const rebootInstance = async (instanceId) => {
    try {
        ec2Client = new EC2Client({region: "us-east-1"});
        const data = await ec2Client.send(new RebootInstancesCommand({InstanceIds: [instanceId], DryRun: false}));
        console.log("Rebooting server successful");
        return true;
    } catch(err) {
        console.log("Error rebooting server", err);
        return false;
    }
}

/**
 * Terminate a server with a specified instance ID.
 * @param {string} instanceId The instance ID of the server to terminate.
 * @returns Whether or not the terminating of the server was successful.
 */
const terminateInstance = async (instanceId) => {
    try {
        ec2Client = new EC2Client({region: "us-east-1"});
        const data = await ec2Client.send(new TerminateInstancesCommand({InstanceIds: [instanceId], DryRun: false}));
        console.log("Terminating server successful");
        return true;
    } catch(err) {
        console.log("Error terminating server", err);
        return false;
    }
}

/**
 * Retrieves instance data.
 */
const getInstances = async () => {
    try {
        ec2Client = new EC2Client({ region: "us-east-1" });
        const data = await ec2Client.send(new DescribeInstancesCommand({}));
        return data;
    } catch {
        console.log("Error");
        return "ERROR";
    }
}

/**
 * Creates an AWS instance.
 */
const createInstance = async (ami, cpu, name) => {
    try {
        // Create key pair
        try {
            // Set the parameters
            const instanceParams = {
                ImageId: ami,
                InstanceType: cpu,
                KeyName: "chargeAWS-discord", //KEY_PAIR_NAME
                MinCount: 1,
                MaxCount: 1,
            };

            const data = await ec2Client.send(new RunInstancesCommand(instanceParams));
            const instanceId = data.Instances[0].InstanceId;
            console.log("Created instance", instanceId);
            // Add tags to the instance
            const tagParams = {
                Resources: [instanceId],
                Tags: [
                    {
                        Key: "Name",
                        Value: name,
                    },
                    {
                        Key: "Cert",
                        Value: "VXE/LXhhaVQ/ZGJwdWdoa0FycTVDbVF1dz9IKWQ0M1g=",
                    },
                ],
            };
            try {
                const data = await ec2Client.send(new CreateTagsCommand(tagParams));
                console.log("Instance tagged");
            } catch (err) {
                console.log("Error", err);
            }
        } catch (err) {
            console.log("Error", err);
        }
    } catch(err) {
        console.log("Error", err);
    }
};

/**
 * Class that stores the necessary information for each AWS server instance.
 */
class Server {
    /**
     * Constructs a new Server object.
     * @param {string} name The name of the server.
     * @param {string} id The ID of the server.
     * @param {string} ipv4 The public IPv4 of the server.
     * @param {string} password The decoded password of the server.
     * @param {string} status The server state.
     * @param {string} cpu The CPU details for the server.
     * @param {string} memory The RAM details for the server.
     * @param {string} storage The storage details for the server.
     */
    constructor(name, id, ipv4, password, status, cpu, memory, storage) {
        this.name = name;
        this.id = id;
        this.ipv4 = ipv4;
        this.password = password;
        this.status = status;
        this.cpu = cpu;
        this.memory = memory;
        this.storage = storage;
    }
}

module.exports = 
{ 
    connectionTest, getInstances, startInstance, 
    stopInstance, rebootInstance, terminateInstance, 
    Server 
};