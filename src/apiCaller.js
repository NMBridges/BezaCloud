const {
    CreateTagsCommand,
    RunInstancesCommand,
    EC2Client,
    DescribeInstancesCommand,
    StartInstancesCommand,
    StopInstancesCommand,
    RebootInstancesCommand,
    TerminateInstancesCommand,
    CreateKeyPairCommand,
    DescribeKeyPairsCommand,
    GetPasswordDataCommand,
} = require("@aws-sdk/client-ec2");
var ec2Client = new EC2Client({ region: "us-east-1"});
const fs = require('fs');
const homeDir = require('os').homedir();

/**
 * @returns The directory where the credentials and config files are stored.
 */
 function awsDir() {
    return homeDir + "/.aws";
}

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
 * Returns a random alphanumeric string.
 * @param {number} len Length of string to return.
 */
function genRandom(len) {
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var output = "";
    for(var index = 0; index < len; index++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        output += characters.substring(randomIndex, randomIndex + 1);
    }
    return output;
}

/** 
 * Creates an .pem file.
 * @param {string} key
 * @param {string} text
 */ 
function createPemFile(key, text) {
    if(!fs.existsSync(awsDir() + "/" + key + ".pem")) {
        fs.appendFileSync(awsDir() + "/" + key + ".pem", text);
    } else {
        fs.writeFileSync(awsDir() + "/" + key + ".pem", text);
    }
}

/**
 * Creates a key pair and returns the automatically generated key.
 */
const createKeyPair = async () => {
    try {
        ec2Client = new EC2Client({ region: "us-east-1" });
        const keyName = genRandom(16);
        const data = await ec2Client.send(new CreateKeyPairCommand({KeyName: keyName}));
        console.log(data.KeyMaterial);
        createPemFile(keyName, "" + data.KeyMaterial);
        console.log("Successfully generated key pair", data)
        return keyName;
    } catch {
        console.log("Error creating key pair");
        return "ERROR";
    }
};

/**
 * Returns the password for the inputted key.
 * @param {string} key The key for the key pair.
 */
const getKeyPassword = async (key) => {
    try {
        ec2Client = new EC2Client({ region: "us-east-1" });
        const data = await ec2Client.send(new DescribeKeyPairsCommand({}));
        if(key in data) {
            console.log("Successfully retrieved key pair", keyName);
            return data[key];
        } else {
            console.log("Error retrieving key pair1", data);
            return "ERROR";
        }
    } catch {
        console.log("Error retrieving key pair2");
        return "ERROR";
    }
};

/**
 * Gets the password of the recently-created server.
 * @param {string} instanceId The server ID.
 * @param {string} key The key to the key pair used for the instance.
 * @returns 
 */
const getInstancePasswordData = async (instanceId) => {
    try {
        ec2Client = new EC2Client({ region: "us-east-1" });
        
        const data = await ec2Client.send(new GetPasswordDataCommand({InstanceId: instanceId}));
        
        console.log("Successfully retrieved password data", data);
        return data;
    } catch(err) {
        console.log("Error retrieving password data", err);
        return "ERROR";
    }
};

/**
 * Creates an AWS instance.
 */
const createInstance = async (ami, cpu, name, key) => {
    try {
        ec2Client = new EC2Client({ region: "us-east-1" });

        // Set the parameters
        const instanceParams = {
            ImageId: ami,
            InstanceType: cpu,
            KeyName: key, //KEY_PAIR_NAME
            MinCount: 1,
            MaxCount: 1,
            SecurityGroupIds: ["sg-00d89e15ff70fee79"],
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
                    Key: "Pair",
                    Value: key,
                },
            ],
        };
        try {
            const data = await ec2Client.send(new CreateTagsCommand(tagParams));
            console.log("Instance tagged");
            return instanceId;
        } catch (err) {
            console.log("Error", err);
            return instanceId;
        }
    } catch (err) {
        console.log("Error", err);
        return "ERROR";
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
     * @param {string} key The key pair key for the password of the server.
     * @param {string} status The server state.
     * @param {string} cpu The CPU details for the server.
     * @param {string} memory The RAM details for the server.
     * @param {string} storage The storage details for the server.
     */
    constructor(name, id, ipv4, password, key, status, cpu, memory, storage) {
        this.name = name;
        this.id = id;
        this.ipv4 = ipv4;
        this.password = password;
        this.key = key;
        this.status = status;
        this.cpu = cpu;
        this.memory = memory;
        this.storage = storage;
    }
}

module.exports = 
{ 
    Server, connectionTest, getInstances, startInstance, 
    stopInstance, rebootInstance, terminateInstance, 
    createKeyPair, getKeyPassword, getInstancePasswordData,
    createInstance
};