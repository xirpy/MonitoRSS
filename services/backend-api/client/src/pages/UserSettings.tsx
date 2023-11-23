import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertDescription,
  AlertTitle,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
  Link,
  ListItem,
  OrderedList,
  Spinner,
  Stack,
  Switch,
  Text,
  chakra,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { InferType, bool, object } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { GetUserMeOutput, useUpdateUserMe, useUserMe } from "../features/discordUser";
import { BoxConstrained, ConfirmModal, DashboardContentV2, PricingDialog } from "../components";
import { useLogin } from "../hooks";
import { notifyError } from "../utils/notifyError";
import { notifySuccess } from "../utils/notifySuccess";
import { useCreateSubscriptionResume } from "../features/subscriptionProducts/hooks/useCreateSubscriptionResume";
import { ProductKey } from "../constants";
import getChakraColor from "../utils/getChakraColor";

const formSchema = object({
  alertOnDisabledFeeds: bool(),
});

type FormData = InferType<typeof formSchema>;

const convertUserMeToFormData = (getUserMeOutput?: GetUserMeOutput): FormData => {
  return {
    alertOnDisabledFeeds: !!getUserMeOutput?.result?.preferences?.alertOnDisabledFeeds,
  };
};

const ChangePaymentMethodUrlButton = () => {
  const { status, data } = useUserMe({
    input: {
      data: {
        includeManageSubUrls: true,
      },
    },
  });

  if (!data || data.result.subscription.product.key === ProductKey.Free) {
    return null;
  }

  return (
    <Button
      size="sm"
      variant="outline"
      as="a"
      href={data?.result.subscription.updatePaymentMethodUrl}
      target="_blank"
      rel="noopener noreferrer"
      isLoading={status === "loading"}
    >
      Change Payment Method
    </Button>
  );
};

export const UserSettings = () => {
  const [checkForSubscriptionUpdateAfter, setCheckForSubscriptionUpdateAfter] = useState<Date>();
  const { status, error, data } = useUserMe({
    checkForSubscriptionUpdateAfter,
  });
  const { t } = useTranslation();
  const { mutateAsync } = useUpdateUserMe();
  const { redirectToLogin } = useLogin();
  const { mutateAsync: resumeSubscription } = useCreateSubscriptionResume();
  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isDirty },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(formSchema),
    mode: "all",
  });
  const hasLoaded = status !== "loading";

  useEffect(() => {
    reset(convertUserMeToFormData(data));
  }, [hasLoaded]);

  const hasEmailAvailable = !!data?.result?.email;

  const onClickGrantEmailAccess = () => {
    redirectToLogin({
      addScopes: "email",
    });
  };

  const onSubmit = async ({ alertOnDisabledFeeds }: FormData) => {
    try {
      const response = await mutateAsync({
        details: {
          preferences: {
            alertOnDisabledFeeds,
          },
        },
      });
      reset(convertUserMeToFormData(response));
      notifySuccess(t("common.success.savedChanges"));
    } catch (err) {
      notifyError(t("common.errors.somethingWentWrong"), (err as Error).message);
    }
  };

  const onClickResumeSubscription = async () => {
    try {
      const beforeUpdateDate = new Date();
      await resumeSubscription();
      setCheckForSubscriptionUpdateAfter(beforeUpdateDate);
    } catch (err) {
      notifyError(t("common.errors.somethingWentWrong"), (err as Error).message);
    }
  };

  // Handle polling result after clicking resume subscription
  const subscriptionLastUpdated = data?.result.subscription.updatedAt;
  useEffect(() => {
    if (!subscriptionLastUpdated || !checkForSubscriptionUpdateAfter) {
      return;
    }

    if (new Date(subscriptionLastUpdated).getTime() > checkForSubscriptionUpdateAfter.getTime()) {
      setCheckForSubscriptionUpdateAfter(undefined);
      notifySuccess(t("common.success.savedChanges"));
    }
  }, [subscriptionLastUpdated, checkForSubscriptionUpdateAfter]);

  const subscription = data?.result.subscription;
  const subscriptionPendingCancellation = subscription && subscription?.cancellationDate;

  let subscriptionText: React.ReactNode;

  if (subscription?.cancellationDate) {
    subscriptionText = (
      <Text>
        You are currently on{" "}
        <chakra.span fontWeight={600}>
          {subscription?.product.name} (billed every {subscription.billingInterval})
        </chakra.span>
        , scheduled to be cancelled on{" "}
        {new Date(subscription.cancellationDate).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        .
      </Text>
    );
  } else if (subscription?.nextBillDate) {
    subscriptionText = (
      <Text>
        You are currently on{" "}
        <chakra.span fontWeight={600}>
          {subscription?.product.name} (billed every {subscription.billingInterval})
        </chakra.span>
        , scheduled to renew on{" "}
        {new Date(subscription.nextBillDate).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        .
      </Text>
    );
  } else if (subscription) {
    subscriptionText = (
      <Text>
        You are currently on{" "}
        <chakra.span fontWeight={600}>
          {subscription.product.name}
          {subscription.billingInterval && ` (billed every ${subscription.billingInterval})`}
        </chakra.span>
        .
      </Text>
    );
  }

  return (
    <DashboardContentV2 error={error} loading={status === "loading"}>
      {checkForSubscriptionUpdateAfter && (
        <Stack
          backdropFilter="blur(3px)"
          alignItems="center"
          justifyContent="center"
          height="100vh"
          position="absolute"
          background="blackAlpha.700"
          top={0}
          left={0}
          width="100vw"
          zIndex={10}
        >
          <Spinner />
          <Text>Applying changes...</Text>
        </Stack>
      )}
      <BoxConstrained.Wrapper>
        <BoxConstrained.Container paddingTop={10} spacing={6} paddingBottom={32}>
          <Stack spacing={8}>
            <Stack justifyContent="flex-start" width="100%">
              <Heading>Settings</Heading>
            </Stack>
            <Stack spacing={8}>
              <Heading size="md">Account</Heading>
              <Stack>
                <Text fontWeight={600} color="whiteAlpha.700">
                  Email
                </Text>
                <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap">
                  <Text>
                    {data?.result?.email || (
                      <chakra.span color="gray.560">(no email available)</chakra.span>
                    )}
                  </Text>
                  <Button
                    variant="link"
                    color="blue.300"
                    leftIcon={<RepeatIcon />}
                    onClick={onClickGrantEmailAccess}
                  >
                    Refresh Email
                  </Button>
                </Flex>
              </Stack>
            </Stack>
            {data?.result.enableBilling && (
              <>
                <Divider />
                <Stack spacing={8}>
                  <Stack>
                    <Heading size="md">Billing</Heading>
                  </Stack>
                  {!hasEmailAvailable && (
                    <Alert status="warning" borderRadius="md">
                      <Stack>
                        <AlertTitle>
                          To enable billing for subscriptions, your email is required
                        </AlertTitle>
                        <AlertDescription>
                          <Button
                            variant="solid"
                            colorScheme="blue"
                            onClick={onClickGrantEmailAccess}
                          >
                            Grant email access
                          </Button>
                        </AlertDescription>
                      </Stack>
                    </Alert>
                  )}
                  {hasEmailAvailable && (
                    <Stack>
                      {data && (
                        <Stack spacing={8}>
                          {data.result.isOnPatreon && (
                            <Alert status="info" borderRadius="md">
                              <Stack width="100%">
                                <AlertTitle>
                                  You are currently still on a legacy Patreon plan!
                                </AlertTitle>
                                <AlertDescription>
                                  <Text>
                                    Subscriptions have moved off of Patreon. You are advised to move
                                    your pledge off of Patreon so that you may:
                                  </Text>
                                  <br />
                                  <OrderedList>
                                    <ListItem>Manage your subscription on this site</ListItem>
                                    <ListItem>
                                      Start your subscription on any day of the month
                                    </ListItem>
                                    <ListItem>
                                      Optionally pay upfront for a year at a discount
                                    </ListItem>
                                    <ListItem>Get localized pricing in your currency</ListItem>
                                  </OrderedList>
                                  <br />
                                  <Text>
                                    Be sure to manually cancel your Patreon pledge to avoid double
                                    charges. To cancel your pledge, visit{" "}
                                    <Link
                                      href="https://www.patreon.com/monitorss"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      color="blue.300"
                                    >
                                      Patreon
                                    </Link>
                                    .
                                  </Text>
                                  <Divider mt={4} mb={4} />
                                  <Stack spacing={4}>
                                    <Text fontWeight={600}>Frequently Asked Questions</Text>
                                    <Accordion allowToggle>
                                      <AccordionItem
                                        border="none"
                                        borderLeft={`solid 1px ${getChakraColor("blue.200")}`}
                                      >
                                        <AccordionButton border="none">
                                          <Flex
                                            flex="1"
                                            gap={4}
                                            fontSize={13}
                                            color="blue.200"
                                            alignItems="center"
                                            textAlign="left"
                                          >
                                            Why are subscriptions moving off of Patreon?
                                            <AccordionIcon />
                                          </Flex>
                                        </AccordionButton>
                                        <AccordionPanel>
                                          <Text fontSize={13}>
                                            Patreon has very high fees, its API has had limitations
                                            that both disallowed yearly plans, prevented
                                            subscriptions from starting on any day of the month, and
                                            made tax compliance difficult. While it has worked well
                                            enough in the past, it is not viable for sustaining the
                                            public service that MonitoRSS provides in the long run.
                                          </Text>
                                        </AccordionPanel>
                                      </AccordionItem>
                                    </Accordion>
                                  </Stack>
                                </AlertDescription>
                              </Stack>
                            </Alert>
                          )}
                          {data.result.subscription.product.key !== ProductKey.Free && (
                            <Stack>
                              <Text fontWeight={600} color="whiteAlpha.700">
                                Credit Balance
                              </Text>
                              <Text>
                                Credit is provided as pro-rata refunds when changing plans. It is
                                automatically applied on future transactions.
                              </Text>
                              <Stack spacing={3}>
                                <Text fontSize="xl" fontWeight="semibold">
                                  {data.result.creditBalance.availableFormatted}
                                </Text>
                              </Stack>
                            </Stack>
                          )}
                          <Stack>
                            <Text fontWeight={600} color="whiteAlpha.700">
                              Current Tier
                            </Text>
                            <Stack spacing={3}>
                              {subscriptionText}
                              <HStack>
                                {subscriptionPendingCancellation && (
                                  <Box>
                                    <ConfirmModal
                                      trigger={
                                        <Button size="sm" variant="solid" colorScheme="blue">
                                          Resume subscription
                                        </Button>
                                      }
                                      onConfirm={onClickResumeSubscription}
                                      okText="Resume subscription"
                                      colorScheme="blue"
                                      description="Are you sure you want to resume your subscription?"
                                      title="Resume subscription"
                                    />
                                  </Box>
                                )}
                                {!subscriptionPendingCancellation && (
                                  <PricingDialog
                                    trigger={
                                      <Button size="sm" variant="outline">
                                        Manage Subscription
                                      </Button>
                                    }
                                  />
                                )}
                                {!subscriptionPendingCancellation && (
                                  <ChangePaymentMethodUrlButton />
                                )}
                              </HStack>
                            </Stack>
                          </Stack>
                        </Stack>
                      )}
                    </Stack>
                  )}
                </Stack>
              </>
            )}
            <Divider />
            <Stack spacing={8}>
              <Stack>
                <Heading size="md">Notifications</Heading>
                <Text>Get emailed when events happen that may affect article delivery.</Text>
              </Stack>
              {!hasEmailAvailable && (
                <Alert status="warning" borderRadius="md">
                  <Stack>
                    <AlertTitle>To enable notifications, your email is required</AlertTitle>
                    <AlertDescription>
                      <Button variant="solid" colorScheme="blue" onClick={onClickGrantEmailAccess}>
                        Grant email access
                      </Button>
                    </AlertDescription>
                  </Stack>
                </Alert>
              )}
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={4}>
                  <FormControl as={Flex} justifyContent="space-between" flexWrap="wrap" gap={4}>
                    <Box>
                      <FormLabel htmlFor="email-alerts">
                        Disabled feed or feed connections
                      </FormLabel>
                      <FormHelperText>
                        Whenever feed or feed connections automatically get disabled due to issues
                        while processing.
                      </FormHelperText>
                    </Box>
                    <Controller
                      name="alertOnDisabledFeeds"
                      control={control}
                      render={({ field }) => {
                        return (
                          <Switch
                            size="lg"
                            isDisabled={!hasLoaded || !hasEmailAvailable || isSubmitting}
                            isChecked={!!field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        );
                      }}
                    />
                  </FormControl>
                  <Flex justifyContent="flex-end">
                    <Button
                      colorScheme="blue"
                      type="submit"
                      isLoading={isSubmitting}
                      isDisabled={!isDirty || isSubmitting}
                      width="min-content"
                    >
                      {t("common.buttons.save")}
                    </Button>
                  </Flex>
                </Stack>
              </form>
            </Stack>
          </Stack>
        </BoxConstrained.Container>
      </BoxConstrained.Wrapper>
    </DashboardContentV2>
  );
};