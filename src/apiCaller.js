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
    DescribeSecurityGroupsCommand,
    CreateSecurityGroupCommand,
    DescribeVpcsCommand,
    AuthorizeSecurityGroupIngressCommand,
    IpPermission,
    CreateImageCommand,
    DescribeImagesCommand,
    ModifyImageAttributeCommand,
    DeregisterImageCommand,
    CopyImageCommand,
} = require("@aws-sdk/client-ec2");
const {
    GetCostAndUsageCommand, CostExplorerClient
} = require("@aws-sdk/client-cost-explorer");
const {
    getRegion, unixToDate
} = require("./mercor.js");
var ec2Client = new EC2Client({ region: "us-east-1"});
var ceClient = new CostExplorerClient({ region: "us-east-1"});
const fs = require('fs');
const homeDir = require('os').homedir();
const { exec, execSync } = require('child_process');
const promiseExec = require('util').promisify(exec);

/**
 * @returns The directory where the credentials and config files are stored.
 */
 function awsDir() {
    return homeDir + "/.aws";
}

/**
 * Resets the ec2Client variable to have the correct region.
 * @returns a version of the client with the correct region.
 */
function resetEC2Client() {
    return new EC2Client({ region: getRegion()});
}

/**
 * Resets the ceClient variable to have the correct region.
 * @returns a version of the client with the correct region.
 */
function resetCEClient() {
    return new CostExplorerClient({ region: getRegion()});
}

/**
 * Tests to see if the AWS credentials are valid
 */
const connectionTest = async () => {
    try {
        ec2Client = resetEC2Client();
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
        ec2Client = resetEC2Client();
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
        ec2Client = resetEC2Client();
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
        ec2Client = resetEC2Client();
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
        ec2Client = resetEC2Client();
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
        ec2Client = resetEC2Client();
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
 * @returns The default VPC of the user in that region.
 */
const getDefaultVpcId = async () => {
    try {
        ec2Client = resetEC2Client();
        const data = await ec2Client.send(new DescribeVpcsCommand({}));
        for(var index = 0; index < data.Vpcs.length; index++) {
            if(data.Vpcs[index].IsDefault) {     
                console.log("Successfully retrieved default VPC ID", data.Vpcs[index].VpcId)
                return data.Vpcs[index].VpcId;
            }
        }
        console.log("Error retrieving VPC IDs");
        return "ERROR";
    } catch(err) {
        console.log("Error retrieving VPC IDs", err);
        return "ERROR";
    }
}

/**
 * Returns the user's security groups.
 */
const getSecurityGroups = async () => {
    try {
        ec2Client = resetEC2Client();
        const data = await ec2Client.send(new DescribeSecurityGroupsCommand({}));
        console.log("Successfully retrieved security groups", data.SecurityGroups)
        return data.SecurityGroups;
    } catch(err) {
        console.log("Error retrieving security groups", err);
        return ["ERROR"];
    }
}

/**
 * Returns whether or not the account has a security group named "mercorSecGroup."
 * @param {SecGroups[]} secGroups The account's security groups.
 * @returns 
 */
function getMercorSecurityGroupId(secGroups) {
    for(var index = 0; index < secGroups.length; index++) {
        if(secGroups[index].GroupName == "mercorSecGroup") {
            console.log("Mercor security group exists", secGroups[index]);
            return secGroups[index].GroupId;
        }
    }
    return "NONE";
}

/**
 * Creates a new security group called "mercorSecGroup"
 */
const createMercorSecurityGroup = async (vpcId) => {
    try {
        ec2Client = resetEC2Client();
        const data = await ec2Client.send(new CreateSecurityGroupCommand({GroupName: "mercorSecGroup", Description: "absolutely free", VpcId: vpcId}));

        try {
            const data2 = await ec2Client.send(new AuthorizeSecurityGroupIngressCommand({
                GroupName: "mercorSecGroup",
                GroupId: data.GroupId,
                IpPermissions: [{
                    IpProtocol: "-1",
                    FromPort: -1,
                    ToPort: -1,
                    IpRanges: [{"CidrIp":"0.0.0.0/0"}]
                }]
            }));
            console.log("Successfully created security group", data2);
            return data.groupId;
        } catch(err) {
            console.log("Error creating security group", err);
            return "ERROR";
        }
    } catch(err) {
        console.log("Error creating security group", err);
        return "ERROR";
    }
}

/**
 * Creates a key pair and returns the automatically generated key.
 */
const createKeyPair = async (key) => {
    try {
        ec2Client = resetEC2Client();
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
 * Creates an .pem file.
 * @param {string} key
 * @param {string} text
 */ 
function createPemFile(key, text) {
    if(!fs.existsSync(awsDir() + "/connections/" + key + ".pem")) {
        fs.appendFileSync(awsDir() + "/connections/" + key + ".pem", text);
    } else {
        fs.writeFileSync(awsDir() + "/connections/" + key + ".pem", text);
    }
}

/** 
 * Returns where a .pem file with the specified key exists.
 * @param {string} key
 */ 
function pemFileExists(key) {
    return fs.existsSync(awsDir() + "/connections/" + key + ".pem");
}

/**
 * Gets the password of the recently-created server.
 * @param {string} instanceId The server ID.
 * @param {string} key The key to the key pair used for the instance.
 * @returns 
 */
const getInstancePasswordData = async (instanceId) => {
    try {
        ec2Client = resetEC2Client();
        const data = await ec2Client.send(new GetPasswordDataCommand({InstanceId: instanceId}));
        console.log("Successfully retrieved password data", data);
        return data;
    } catch(err) {
        console.log("Error retrieving password data", err);
        return "ERROR";
    }
};

const addTags = async (instanceId, tag, value) => {
    try {
        ec2Client = resetEC2Client();
        const tagParams = {
            Resources: [instanceId],
            Tags: [
                {
                    Key: tag,
                    Value: value,
                },
            ],
        };
        const data = await ec2Client.send(new CreateTagsCommand(tagParams));
        console.log("Instance tagged");
        return true;
    } catch (err) {
        console.log("Error tagging instance", err);
        return false;
    }
};

/**
 * Returns the AMIs that the user owns.
 */
async function getUserAMIs() {
    try {
        ec2Client = resetEC2Client();
        const data = await ec2Client.send(new DescribeImagesCommand({Owners: ["self"]}));
        console.log("Successfully described user's images", data);
        return data;
    } catch (err) {
        console.log("Error describing user's images", err);
        return false;
    }
};

/**
 * Returns the image data regarding the given list of AMI IDs.
 * @param {string[]} amiIds The list of AMI IDs to get data about.
 * @returns The AMI data, given the AMI IDs.
 */
const getAmiData = async (amiIds) => {
    try {
        ec2Client = resetEC2Client();
        const data = await ec2Client.send(new DescribeImagesCommand({ImageIds: amiIds}));
        console.log("Successfully describe images", data);
        return data;
    } catch (err) {
        console.log("Error describing images", err);
        return false;
    }
}

/**
 * Changes the visibility of an AMI.
 * @param {string} id The AMI ID to alter.
 * @param {string} public Whether the AMI should be made public.
 */
const changeAmiVisibility = async (id, public) => {
    try {
        ec2Client = resetEC2Client();
        var parameters;
        if(public) {
            parameters = {
                ImageId: id, 
                LaunchPermission: {
                    Add: [
                        { 
                            Group: "all"
                        }
                    ],
                    Remove: [
                        {
    
                        }
                    ]
                }
            }
        } else {
            parameters = {
                ImageId: id, 
                LaunchPermission: {
                    Remove: [
                        {
                            Group: "all"
                        }
                    ]
                }
            }
        }
        const data = await ec2Client.send(new ModifyImageAttributeCommand(parameters));
        console.log("Successfully changed the AMI visibility", data);
        return data;
    } catch(err) {
        console.log("Error changing the AMI visibility", err);
        return "ERROR";
    }
};

/**
 * Creates a new AMI based on an instance.
 * @param {string} id The instance ID to base the AMI on.
 * @param {string} name The name of the new AMI.
 */
const createImage = async (id, name) => {
    try {
        ec2Client = resetEC2Client();
        const data = await ec2Client.send(new CreateImageCommand({InstanceId: id, Name: name}));
        console.log("Successfully created image", data);
        return data;
    } catch(err) {
        console.log("Error creating image", err);
        return "ERROR";
    }
};

/**
 * Creates a new AMI in another region based on another AMI.
 * @param {string} id The AMI ID to base the AMI on.
 * @param {string} name The name of the new AMI.
 * @param {string} newRegion The new region to copy to.
 */
 const copyImage = async (id, name, newRegion) => {
    try {
        ec2Client = new EC2Client({ region: newRegion});
        const data = await ec2Client.send(new CopyImageCommand({SourceImageId: id, SourceRegion: getRegion(), Name: name}));
        console.log("Successfully moved image", data);
        return data;
    } catch(err) {
        console.log("Error moving image", err);
        return "ERROR";
    }
};

/**
 * Deletes an AMI.
 * @param {string} id The ID of the AMI to delete.
 */
const deleteImage = async (id) => {
    try {
        ec2Client = resetEC2Client();
        const data = await ec2Client.send(new DeregisterImageCommand({ImageId: id}));
        console.log("Successfully deleted image", data);
        return data;
    } catch(err) {
        console.log("Error deleting image", err);
        return "ERROR";
    }
};

/**
 * @param {string} gran The granularity of the spending. Either "DAILY" or "MONTHLY".
 * @returns The spending 
 */
const getSpending = async (gran) => {
    try {
        ceClient = resetCEClient();

        // Set the parameters
        var startDate = "";
        var endDate = "";
        if(gran == "MONTHLY") {
            endDate = unixToDate((Date.now()) / 1000);
            startDate = unixToDate((Date.now() - 31536000000) / 1000);

            if(endDate.substr(8) != "01") {
                var month = "" + ((parseInt(endDate.substr(5, 7)) + 1) % 12);
                if(month.length < 2) { month = "0" + month; }
                
                endDate = endDate.substr(0,4) + "-" + month + "-01";
                startDate = startDate.substr(0,4) + "-" + month + "-01";
            }
        } else if(gran == "DAILY") {
            endDate = unixToDate((Date.now()) / 1000);
            startDate = unixToDate((Date.now() - 2592000000) / 1000);
        }

        console.log(startDate);
        console.log(endDate);

        const ceParams = {
            Granularity: gran,
            Metrics: ["BlendedCost"],
            TimePeriod: {
                End: endDate,
                Start: startDate
            },
            Filter: {
                Not: {
                    Dimensions: {
                        Key: "RECORD_TYPE",
                        Values: [
                            "Refund",
                            "Credit"
                        ],
                        Include: true,
                        Children: null
                    }
                }
            }
        };
        
        const data = await ceClient.send(new GetCostAndUsageCommand(ceParams));
        console.log("Successfully retrieved spending data", data);
        return data;
    } catch(err) {
        console.log("Error", err);
        return "ERROR";
    }
};

/**
 * Creates an AWS instance.
 */
const createInstance = async (ami, cpu, name, key, secGroupId) => {
    try {
        ec2Client = resetEC2Client();

        // Set the parameters
        const instanceParams = {
            ImageId: ami,
            InstanceType: cpu,
            KeyName: key,
            MinCount: 1,
            MaxCount: 1,
            SecurityGroupIds: [secGroupId],
        };

        console.log(instanceParams);

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
            return "ERROR";
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

/**
 * Class that stores the necessary information for each AWS Template (AMI).
 */
 class Template {
    /**
     * Constructs a new Template object.
     * @param {string} name The name of the Template.
     * @param {string} id The AMI ID of the Template.
     * @param {string} status The Template availability state.
     * @param {boolean} publ Whether the Template is public or private.
     * @param {string} amiName The AMI name of the Template.
     * @param {string} plat The Template OS platform.
     * @param {string} owner The Template OS platform.
     */
    constructor(name, id, status, pub, amiName, plat, owner) {
        this.name = name;
        this.id = id;
        this.status = status;
        this.pub = pub;
        this.amiName = amiName;
        this.plat = plat;
        this.owner = owner;
    }
}

/**
 * Class that stores the necessary information for each Task.
 */
 class Task {
    /**
     * Constructs a new Task object.
     * @param {string} name The name of the server for the Task to modify.
     * @param {string} id The server ID for the Task to modify.
     * @param {string} type The type of Task. Either 'start' or 'stop'.
     * @param {number} time The Unix time at which the Task should be executed.
     * @param {string} region The region the Task should be executed in.
     */
    constructor(name, id, type, time, region) {
        this.name = name;
        this.id = id;
        this.type = type;
        this.time = time;
        this.region = region;
    }
}

/**
 * Class that stores the necessary information for each cost usage 'Expenditure'.
 */
 class Expenditure {
    /**
     * Constructs a new Expenditure object.
     * @param {string} start The start date of the Expenditure section.
     * @param {string} end The end date of the Expenditure section.
     * @param {number} spending The amount of spending for the Expenditure section.
     * @param {string} currency The currency of the spending.
     */
    constructor(start, end, spending, currency) {
        this.start = start;
        this.end = end;
        this.spending = spending;
        this.currency = currency;
    }
}

module.exports = 
{ 
    Server, Template, Task, Expenditure, connectionTest, getInstances,
    startInstance, stopInstance, rebootInstance, terminateInstance, 
    createKeyPair, getInstancePasswordData, createInstance,
    getSecurityGroups, getMercorSecurityGroupId, getDefaultVpcId,
    createMercorSecurityGroup, pemFileExists, addTags,
    getUserAMIs, changeAmiVisibility, createImage, deleteImage,
    copyImage, getAmiData, genRandom, getSpending
};